import Components from './component'
import plugin from './plugin'
import { makeInstaller } from './make-installer'

export default makeInstaller([...Components, ...plugin])
