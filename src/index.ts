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
export class MVar<a> {
  /**
   * Internal queue for incoming values
   */
  private putQueue: Array<a>

  /**
   * Internal queue for consuming tasks
   */
  private taskQueue: Array<() => void>

  /**
   * Internal constructor of an MVar.
   *
   * Users of the library should use {@link MVar.newEmpty} or {@link MVar.new} instead.
   */
  private constructor (putQueue: Array<a>, taskQueue: Array<() => void>) {
    this.putQueue = putQueue
    this.taskQueue = taskQueue
  }

  /**
   * Return the first-element of the internal putQueue and removes it.
   *
   * CAUTION: If the putQueue is empty the behavior is undefined.
   * A call to this method must be protected by a guard which guarantees that
   * the putQueue is not empty.
   */
  private runTake (): a {
    return this.putQueue.shift()!
  }

  /**
   * Return the first-element of the internal putQueue.
   *
   * CAUTION: If the putQueue is empty the behavior is undefined.
   * A call to this method must be protected by a guard which guarantees that
   * the putQueue is not empty.
   */
  private runRead (): a {
    return this.putQueue[0]!
  }

  /**
   * Return the first element of the internal putQueue, removes it, and queues
   * a new value.
   *
   * CAUTION: If the putQueue is empty the behavior is undefined.
   * A call to this method must be protected by a guard which guarantees that
   * the putQueue is not empty.
   */
  private runSwap (y: a): a {
    const x = this.putQueue.shift()!
    this.putQueue.push(y)
    return x
  }

  /**
   * Schedule a thunk. Returns a promise that resolves with the return value
   * from the thunk when it is executed.
   *
   * If the putQueue is empty the thunk is executed synchrounsly;
   * otherwise the thunk is executed when the next element is put into the queue.
   */
  private schedule (task: () => a): Promise<a> {
    return new Promise(resolve => {
      if (this.putQueue.length > 0) {
        resolve(task())
      } else {
        this.taskQueue.push(() => resolve(task()))
      }
    })
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
    return this.schedule(() => this.runTake())
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
      cont()
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
    return this.schedule(() => this.runRead())
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
    return this.schedule(() => this.runSwap(y))
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
      return this.runTake()
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
      this.put(x)
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
      return this.runRead()
    } else {
      throw new MVarEmptyError()
    }
  }
}
