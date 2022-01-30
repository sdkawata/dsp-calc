import { Factories } from "./types";

declare global {
    namespace jest {
        interface Matchers<R extends Factories> {
            toBeSameFactories(factories:Factories)
        }
    }
}