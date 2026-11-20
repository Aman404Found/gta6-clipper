import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';

const workspace = mkdtempSync(join(tmpdir(), 'clipper-e2e-'));
const entry = resolve('main.ts');
const cases = [
  ['watch', JSON.stringify({url:'https://www.youtube.com/watch?v=RiR77AI4uQ8'}), true],
  ['short', JSON.stringify({url:'https://m.youtube.com/shorts/RiR77AI4uQ8?feature=share'}), true],
  ['share', JSON.stringify({url:'https://youtu.be/RiR77AI4uQ8#t=2'}), true],
  ['placeholder', JSON.stringify({url:'https://www.youtube.com/shorts/<id>'}), false],
  ['lookalike', JSON.stringify({url:'https://youtube.com.evil.test/watch?v=RiR77AI4uQ8'}), false],
  ['extra-path', JSON.stringify({url:'https://youtu.be/RiR77AI4uQ8/extra'}), false],
  ['http', JSON.stringify({url:'http://youtube.com/watch?v=RiR77AI4uQ8'}), false],
  ['long-id', JSON.stringify({url:'https://youtu.be/RiR77AI4uQ8x'}), false],
  ['space', JSON.stringify({url:' https://youtu.be/RiR77AI4uQ8'}), false],
  ['null', 'null', false],
  ['array', '[]', false],
  ['bad-json', '{', false],
  ['oversize', ' '.repeat(16385), false],
];
try {
  for (const [label, input, valid] of cases) {
    writeFileSync(join(workspace, 'VIDEO.json'), input);
    const output = join(workspace, label);
    const result = spawnSync(process.execPath, [entry], {
      env: {...process.env, MAKEFUN_BOT_DIR: workspace, MAKEFUN_OUTPUT_DIR: output},
      encoding: 'utf8',
    });
    assert.equal(result.status, valid ? 0 : 1, `${label}: ${result.stderr}`);
    if (valid) {
      assert.equal(readFileSync(join(output, 'VIDEO.json'), 'utf8'), input);
      assert.equal(result.stdout, '');
      assert.equal(result.stderr, '');
    } else {
      assert.match(result.stderr, /Entry failed:/);
      assert.equal(existsSync(join(output, 'VIDEO.json')), false);
    }
    console.log(`PASS ${label}`);
  }
  assert.match(readFileSync('VIDEO.json', 'utf8'), /<id>/);
  console.log(`PASS ${cases.length} end-to-end cases; repository placeholder unchanged`);
} finally {
  rmSync(workspace, {recursive: true, force: true});
}
