interface IHasTypeName<TTypeName extends string> {
  readonly _typeName: TTypeName;
}

// Get the type name from some interface.
type IdType<THasTypeName extends IHasTypeName<string>> = THasTypeName extends IHasTypeName<infer TIdType>
  ? TIdType
  : never;

export type Id<THasTypeName extends IHasTypeName<string>, TId extends string = string> =
  `${IdType<THasTypeName>}-${TId}`;
