export interface HKT<URI, A> {
  readonly _URI: URI;
  readonly _A: A;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface URItoKind<A> {}

export type URIS = keyof URItoKind<any>;

export type Kind<URI extends URIS, A> = URI extends URIS ? URItoKind<A>[URI] : any;
