import { Factories } from "../src/types"
import {diff} from 'jest-diff';

expect.extend({
    toBeSameFactories(received, expect) {
        const normalize = (factories:Factories): Factories => {
            return {
                factories: factories.factories.sort()
            }
        }
        const normalizedActual = normalize(received)
        const normalizedExpect = normalize(expect)
        const pass = this.equals(normalizedActual, normalizedExpect)
        return {
            message: () => this.utils.matcherHint('toBeStrictEqual', undefined, undefined, undefined)
                + "\n\n"
                + `Diff: ${diff(normalizedActual, normalizedExpect)}`,
            pass,
        }
    }
})