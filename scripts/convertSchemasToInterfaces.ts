/**
 * This script takes types defined in the `data/schemas` folder and
 * auto-generates Typescript interfaces for them to be used in the rest of the
 * project.
 */

import fs from 'fs'
import { compileFromFile } from 'json-schema-to-typescript'

const schemasPath = 'data/schemas'
const typesPath = 'data/types'

fs.readdir(schemasPath, (err, files) => {
  if (err) console.log(err.message)

  files.forEach((file) => {
    if (file === 'ids.json') return

    const schemaPath = `${schemasPath}/${file}`
    const typePath = `${typesPath}/${file}`.replace('.json', '.ts')

    compileFromFile(schemaPath, {
      cwd: 'data/schemas',
      additionalProperties: false,
    })
      .then((ts) => fs.writeFileSync(typePath, ts))
      .catch((e) => console.error(e))
  })
})
