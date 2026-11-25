// SPDX-License-Identifier: Apache-2.0
import { z } from 'zod';
import { mkdir, writeFile } from 'node:fs/promises';
import { projectSchema, timelineSchema, assetManifestSchema } from '../dist/packages/shared/src/schema.js';
await mkdir('schemas', { recursive: true });
for (const [name, schema] of Object.entries({ project: projectSchema, timeline: timelineSchema, assets: assetManifestSchema })) {
  await writeFile(`schemas/${name}.schema.json`, JSON.stringify(z.toJSONSchema(schema, { target: 'draft-2020-12', io: 'input' }), null, 2) + '\n');
}
