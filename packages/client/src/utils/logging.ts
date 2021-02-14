interface PromiseLike<R> {
  then: (success: (val: R) => R, fail: (err: Error) => Promise<R>) => R;
}

export function logged<P extends unknown[], R>(
  name: string,
  cb: (...args: P) => R,
): (...args: P) => R {
  function asPromise(val: R): PromiseLike<R> {
    // @ts-ignore
    return val;
  }

  return (...args: P): R => {
    console.log("Calling", name, args);
    try {
      let result = cb(...args);

      if (result && typeof result == "object" && "then" in result) {
        return asPromise(result).then(
          (result: R) => {
            console.log("Returned", name, result);
            return result;
          },
          (error: Error) => {
            console.error("Error", name, error);
            return Promise.reject(error);
          },
        );
      }

      console.log("Returned", name, result);
      return result;
    } catch (error) {
      console.error("Error", name, error);
      throw error;
    }
  };
}
