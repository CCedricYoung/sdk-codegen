/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 Looker Data Sciences, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import { NodeTransport } from './nodeTransport'
import { NodeSession } from './nodeSession'
import { NodeSettingsIniFile } from './nodeSettings'
import * as fs from 'fs'
import * as yaml from 'js-yaml'

// TODO create destructurable function for test path resolution
const dataFile = 'test/data.yml'
// slightly hackish data path determination for tests
const root = fs.existsSync(dataFile) ? '' : '../../'
const testData = yaml.safeLoad(fs.readFileSync(`${root}${dataFile}`, 'utf-8'))
const localIni = `${root}${testData['iniFile']}`

describe('NodeSession', () => {
  const settings = new NodeSettingsIniFile(localIni, 'Looker')
  const transport = new NodeTransport(settings)

  describe('isAuthenticated', () => {
    it('unauthenticated logout returns false', async () => {
      const session = new NodeSession(settings, transport)
      expect(session.isAuthenticated()).toEqual(false)
      const actual = await session.logout()
      expect(actual).toEqual(false)
    })
  })

  describe('integration tests', () => {
    it('initializes', () => {
      const session = new NodeSession(settings, transport)
      expect(session.settings).toEqual(settings)
      expect(session.isAuthenticated()).toEqual(false)
      expect(session.isSudo()).toEqual(false)
    })

    it('default auth logs in and out with good credentials', async () => {
      const session = new NodeSession(settings, transport)
      expect(session.isAuthenticated()).toEqual(false)
      const token = await session.login()
      expect(token).toBeDefined()
      expect(token.access_token).toBeDefined()
      expect(session.isAuthenticated()).toEqual(true)
      const result = await session.logout()
      expect(result).toEqual(true)
      expect(session.isAuthenticated()).toEqual(false)
    })
  })
})
