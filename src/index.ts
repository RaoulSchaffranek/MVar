/**
 * Internal type-alias for asynchronous tasks.
 */
type Task<a> =
  {take: (x: a) => void} |
  {read: (x: a) => void} |
  {swap: (x: a) => void, x: a}

/**
 * Represents a runtime-exception, that occurs when trying to read
 * or take a value from an empty MVar. {@link MVar.prototype.tryRead} and {@link MVar.prototype.tryTake}
 */
export class MVarEmptyError extends Error {
  constructor () {
    super()
    Object.setPrototypeOf(this, MVarEmptyError.prototype)
  }
}

/**
 * Represents a mutable variable.
 *
 * An MVar can be thought of as an asynchronous first-in-first-out-queue,
 * where {@link MVar.prototype.put} queues values and {@link MVar.prototype.take} takes values
 * of the queue.
 *
 * An MVar can be used to synchronize read and write-accesses between
 * concurrent tasks.
 */
export default class MVar<a> {
  /**
   * Internal queue for incoming values
   */
  private putQueue: Array<a>

  /**
   * Internal queue for consuming tasks
   */
  private taskQueue: Array<Task<a>>

  /**
   * Internal constructor of an MVar.
   *
   * Users of the library should use {@link MVar.newEmpty} or {@link MVar.new} instead.
   */
  private constructor (putQueue: Array<a>, taskQueue: Array<Task<a>>) {
    this.putQueue = putQueue
    this.taskQueue = taskQueue
  }

  /**
   * Create an MVar which is initially empty.
   */
  public static newEmpty<a> (): MVar<a> {
    return new MVar<a>([], [])
  }

  /**
   * Create an MVar which contains the supplied value.
   */
  public static new<a> (value: a): MVar<a> {
    return new MVar<a>([value], [])
  }

  /**
   * Return the contents of the MVar wrapped in a promise.
   *
   * If the MVar is empty, the promise resolves once the MVar becomes full.
   * If the MVar is full, the returned promise resolves synchronously
   * with the contents.
   *
   * When the promise is resolved, the MVar is left empty.
   */
  public take (): Promise<a> {
    if (this.putQueue.length === 0) {
      return new Promise(resolve => {
        this.taskQueue.push({ take: resolve })
      })
    } else {
      const x = this.putQueue.shift()!
      return Promise.resolve(x)
    }
  }

  /**
   * Put a value into an MVar.
   *
   * If the MVar is empty, sets the contents of the MVar.
   * If the MVar is full, queues the value until the MVar becomes empty.
   */
  public put (y: a): void {
    this.putQueue.push(y)
    while (this.taskQueue.length !== 0 && this.putQueue.length !== 0) {
      const cont = this.taskQueue.shift()!
      if ('take' in cont) {
        const x = this.putQueue.shift()!
        cont.take(x)
      } else if ('read' in cont) {
        const x = this.putQueue[0]
        cont.read(x)
      } else /* if ('swap' in cont) */ {
        const x = this.putQueue.shift()!
        cont.swap(x)
        this.putQueue.push(cont.x)
      }
    }
  }

  /**
   * Read the contents of an MVar wrapped in a promise.
   *
   * If the MVar is empty, the returned promise is resolved once the MVar
   * becomes full.
   * If the MVar is full, the returned promise is synchronously
   * resolved with the contents.
   *
   * Read does not alter the contents of the MVar.
   */
  public read (): Promise<a> {
    if (this.putQueue.length === 0) {
      return new Promise(resolve => {
        this.taskQueue.push({ read: resolve })
      })
    } else {
      const x = this.putQueue[0]
      return Promise.resolve(x)
    }
  }

  /**
   * Take a value from an MVar, put a new value into the MVar and return the
   * value taken wrapped in a promise.
   *
   * If the MVar is empty, the promise resolves once the MVar becomes full.
   * If the MVar is full, the returned promise resolves synchronously
   * with the contents.
   *
   * Queues the supplied value for later consumption.
   */
  public swap (y: a): Promise<a> {
    if (this.putQueue.length === 0) {
      return new Promise(resolve => {
        this.taskQueue.push({ swap: resolve, x: y })
      })
    } else {
      const x = this.putQueue.shift()!
      this.putQueue.push(y)
      return Promise.resolve(x)
    }
  }

  /**
   * A synchronous version of take.
   *
   * If the MVar is empty, throws an exception.
   * If the MVar is full, returns the contents of the MVar.
   *
   * After tryTake, the MVar is left empty.
   */
  public tryTake (): a {
    if (this.putQueue.length !== 0) {
      return this.putQueue.shift()!
    } else {
      throw new MVarEmptyError()
    }
  }

  /**
   * A synchronous version of put.
   *
   * If the MVar is empty, sets the contents of the MVar and returns true.
   * If the MVar is full, does nothing and returns false
   */
  public tryPut (x: a): boolean {
    if (this.putQueue.length === 0) {
      this.putQueue.push(x)
      return true
    }
    return false
  }

  /**
   * Check whether a given MVar is empty.
   *
   * If the MVar is empty, returns true.
   * If the MVar is full, returns false.
   */
  public isEmpty (): boolean {
    return this.putQueue.length === 0
  }

  /**
   * A synchronous version of read.
   *
   * If the MVar is empty, throws an exception.
   * If the MVar is full, returns the contents of the MVar.
   *
   * tryRead does not alter the contents of the MVar.
   */
  public tryRead (): a {
    if (this.putQueue.length !== 0) {
      return this.putQueue[0]
    } else {
      throw new MVarEmptyError()
    }
  }
}
