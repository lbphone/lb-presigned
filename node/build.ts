import { parseArgs } from 'util'
import { watch } from 'chokidar'
import { sep } from 'path'
import { Glob } from 'bun'
import { rm } from 'node:fs/promises'

const { values } = parseArgs({
    args: Bun.argv,
    options: {
        watch: {
            type: 'boolean'
        }
    },
    strict: true,
    allowPositionals: true
})

const glob = new Glob('./src/**/*.ts')

async function build() {
    console.log('Building...')

    const entrypoints: string[] = []

    for await (const file of glob.scan('.')) {
        entrypoints.push(file)
    }

    await rm('../server', { recursive: true, force: true })

    try {
        const result = await Bun.build({
            entrypoints: entrypoints,
            outdir: '../server',
            format: 'cjs',
            target: 'node',
            minify: { whitespace: true, syntax: true }
        })

        for (const output of result.outputs) {
            let content = await Bun.file(output.path).text()

            const patched = content.replace(/var __dirname = "[^"]*node_modules[^"]*";/g, 'var __dirname = "";')

            if (patched !== content) {
                await Bun.write(output.path, patched)
            }
        }

        console.log('Built')
    } catch (error) {
        console.error('Build failed:', error)
    }
}

await build()

if (values.watch) {
    watch('./src', {
        ignored: [
            (filePath: string) => {
                const basename = filePath.split(sep).pop()
                const dotIndex = basename?.lastIndexOf('.')

                return dotIndex !== -1 && !basename?.endsWith('.ts')
            }
        ],
        persistent: true,
        ignoreInitial: true
    }).on('all', async (event) => {
        if (event === 'add' || event === 'change' || event === 'unlink') {
            build()
        }
    })
}
