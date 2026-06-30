import test from 'node:test';
import assert from 'node:assert/strict';
import { flattenCSharpProject } from './csharpFlattening.js';

test('flattenCSharpProject merges editable C# files into a single Judge0-friendly source', () => {
  const files = [
    {
      path: 'Models/Course.cs',
      content: 'using System;\nusing System.Collections.Generic;\nnamespace App.Models;\npublic class Course { }',
      readOnly: false
    },
    {
      path: 'Services/CourseService.cs',
      content: 'using System;\nusing App.Models;\nnamespace App.Services;\npublic class CourseService { }',
      readOnly: false
    },
    {
      path: 'Program.cs',
      content: 'using App.Services;\nvar service = new CourseService();',
      readOnly: false
    },
    {
      path: 'Readme.txt',
      content: 'not relevant',
      readOnly: false
    },
    {
      path: 'Models/Locked.cs',
      content: 'namespace App.Models;\npublic class Locked { }',
      readOnly: true
    }
  ];

  const result = flattenCSharpProject(files);

  assert.match(result.sourceCode, /using System;/);
  assert.match(result.sourceCode, /using System.Collections.Generic;/);
  assert.match(result.sourceCode, /using App.Models;/);
  assert.match(result.sourceCode, /using App.Services;/);
  assert.match(result.sourceCode, /Source file: Models\/Course\.cs/);
  assert.match(result.sourceCode, /Source file: Program\.cs/);
  assert.ok(!result.sourceCode.includes('using System;\nusing System;'));
  assert.ok(result.sourceCode.includes('public class Course'));
  assert.ok(result.sourceCode.includes('public class CourseService'));
  assert.ok(result.sourceCode.includes('var service = new CourseService();'));
  assert.ok(!result.sourceCode.includes('public class Locked'));
  assert.equal(result.lineMap[0], null);
});
