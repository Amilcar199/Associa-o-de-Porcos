import path from 'path'

export function isInsideDirectory(rootDir: string, targetPath: string): boolean {
  const root = path.resolve(rootDir)
  const target = path.resolve(targetPath)
  const relative = path.relative(root, target)
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative))
}
