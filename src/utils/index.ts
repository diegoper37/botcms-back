export class Utils {
  static pickBy(object: Object, predicate: (value: any) => boolean) {
    const obj = {}

    for (const key in object) {
      if (predicate(object[key])) {
        obj[key] = object[key]
      }
    }

    return obj
  }
}
