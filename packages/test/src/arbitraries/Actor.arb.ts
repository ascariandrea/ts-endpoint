import { Arbitrary } from 'effect';
import { Actor } from '../TestEndpoints/io/Actor.io.js';

export const ActorArb = Arbitrary.make(Actor);
