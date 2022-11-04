//移除T的readonly,返回T
export type Writable<T> = { -readonly [P in keyof T]: T[P] }

//如果T是readonly数组,返回Writable<T>, 否则返回T
export type WritableArray<T> = T extends readonly any[] ? Writable<T> : T

/**
 * 判断传入的类型是否为never, 是返回Y, 默认true, 否, 返回false
 *
 * never 类型是任何类型的子类型，可以赋值给任意类型。
 * 但是没有类型是 never 类型的子类型，即使是 any 类型也不能赋值给 never 类型
 */
export type IfNever<T, Y = true, N = false> = [T] extends [never] ? Y : N

/**
 * 判断传入的类型是不是作为unknown的父集 => any | unknown
 *
 * unknown 类型是 ts 中所有基础类型的父类型，所有基础类型都能赋值为 unknown 类型。
 * 但是当 unknown 类型赋值为其他任意类型时，就会进行类型检查。
 * 我们必须将这个 unknown 类型的变量断言为具体的类型，才可以继续使用。
 */
export type IfUnknown<T, Y, N> = [unknown] extends [T] ? Y : N

//判断传入的类型是不是作为unknown的父集,是返回never,否返回T
export type UnknownToNever<T> = IfUnknown<T, never, T>
