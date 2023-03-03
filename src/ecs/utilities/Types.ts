export enum SchemaKind {
    NativeScalar,
    NativeStruct,
    BinaryScalar,
    BinaryStruct,
    Tag
}

export const Type = {
    Int8: Int8Array,
    uInt8: Uint8Array,
    ui8c: Uint8ClampedArray,
    Int16: Int16Array,
    uInt16: Uint16Array,
    Int32: Int32Array,
    uInt32: Uint32Array,
    Float32: Float32Array,
    Float64: Float64Array,
    String: Array,
    Boolean: Array,
    Custom: Array,
    Tag: null
  }

export enum QueryType {
  WITH,
  WITHOUT,
  ONLY
}

export enum ExecutionTime {
  BEFORE_RENDER,
  POST_RENDER,
  BEFORE_STEP,
  POST_STEP,
  KEYBOARD,
  POINTER,
  WINDOW_MOUSE_MOVE,
  WINDOW_MOUSE_DOWN,
  WINDOW_MOUSE_UP,
  WINDOW_SCROLL,
  SCENE_READY,
}

export type CacheResult = {
  isDirty : Boolean,
  result: any
}

