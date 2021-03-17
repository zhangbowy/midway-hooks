import { resolve } from 'path'
import compiler from './compiler'
import { wrap } from 'jest-snapshot-serializer-raw'

const root = resolve(__dirname, './fixtures/base-app')
const cwd = process.cwd()

const resolveEntry = (path: string | string[]) => {
  if (!Array.isArray(path)) {
    return resolve(__dirname, root, 'src/', path)
  }
  return path.map((p) => resolve(__dirname, root, 'src/', p))
}

async function compile(entry: string) {
  const stats = await compiler(resolveEntry(entry), root)
  const output = stats.toJson().modules.find((mod) => mod.name.includes(entry))

  if (output?.modules?.length) {
    return output.modules.find((mod) => mod.name.includes(entry)).source
  }

  return output.source
}

// Skip due to slow compilation speed
describe.skip('hooks loader with proxy', () => {
  beforeEach(() => {
    process.chdir(root)
  })

  afterEach(() => {
    process.chdir(cwd)
  })

  test('Compile render', async () => {
    const output = await compile('render/[...index].ts')
    expect(wrap(output)).toMatchInlineSnapshot(`
      import { createRequest } from '@midwayjs/hooks-core/request';

      export default createRequest('/', 'default');
      export const foo = createRequest('/', 'foo');
      export const bar = createRequest('/', 'bar');
    `)
  })

  test('Compile lambda', async () => {
    const output = await compile('lambda/index.ts')
    expect(wrap(output)).toMatchInlineSnapshot(`
      import { createRequest } from '@midwayjs/hooks-core/request';

      export default createRequest('/api', 'default');
    `)
  })

  test('the second build should match the first.', async () => {
    const first = await compile('lambda/index.ts')
    const second = await compile('lambda/index.ts')
    expect(first).toEqual(second)
  })

  test('non-lambda files should not be compiled', async () => {
    const output = await compile('util/util.ts')
    expect(wrap(output)).toMatchInlineSnapshot(`
      export function isTrue(value) {
          return value === 'true' || value === true;
      }

    `)
  })
})
