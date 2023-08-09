import { Subject } from 'rxjs'
import { Patch, PatchChannel, PatchStream } from './types'


export const createEcho: () => PatchChannel & PatchStream
  = () => new Subject<Patch>()
