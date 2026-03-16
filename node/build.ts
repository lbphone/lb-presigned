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
        await Bun.build({
            entrypoints: entrypoints,
            outdir: '../server',
            format: 'cjs',
            target: 'node'
            // minify: true
        })

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
