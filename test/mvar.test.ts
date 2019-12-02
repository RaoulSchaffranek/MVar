import MVar, { MVarEmptyError } from '../src'
import { checkForall, integer } from 'jsverify'

/* eslint-env jest */

describe('MVar.newEmpty', () => {
  it('After creating an empty MVar the new MVar is empty', () => {
    const mv = MVar.newEmpty()
    expect(mv.isEmpty()).toBe(true)
  })
})

describe('MVar.tryTake', () => {
  it('Trying to take from an empty MVar throws an exception', () => {
    const mv = MVar.newEmpty()
    expect(() => mv.tryTake()).toThrow(MVarEmptyError)
  })

  it('Trying to take from a full MVar returns the contents', () => {
    const prop = checkForall(
      integer,
      x => MVar.new(x).tryTake() === x
    )
    expect(prop).toBe(true)
  })

  it('After trying to take from a full MVar the MVar is empty', () => {
    const prop = checkForall(
      integer,
      x => {
        const mv = MVar.new(x)
        mv.tryTake()
        return mv.isEmpty()
      }
    )
    expect(prop).toBe(true)
  })
})

describe('MVar.tryRead', () => {
  it('Trying to read from an empty MVar throws an exception', () => {
    const mv = MVar.newEmpty()
    expect(() => mv.tryRead()).toThrow(MVarEmptyError)
  })

  it('Trying to read from a full MVar returns the contents', () => {
    const prop = checkForall(
      integer,
      x => MVar.new(x).tryRead() === x
    )
    expect(prop).toBe(true)
  })

  it('After trying to read from a full MVar the MVar is still full', () => {
    const prop = checkForall(
      integer,
      x => {
        const mv = MVar.new(x)
        mv.tryRead()
        return !mv.isEmpty()
      }
    )
    expect(prop).toBe(true)
  })
})

describe('MVar.tryPut', () => {
  it('Trying to put into an empty MVar sets the contents of the MVar', () => {
    const prop = checkForall(
      integer,
      x => {
        const mv = MVar.newEmpty()
        mv.tryPut(x)
        return mv.tryTake() === x
      }
    )
    expect(prop).toBe(true)
  })

  it('After trying to put into an empty MVar, the MVar is full', () => {
    const prop = checkForall(
      integer,
      x => {
        const mv = MVar.newEmpty()
        mv.tryPut(x)
        return !mv.isEmpty()
      }
    )
    expect(prop).toBe(true)
  })

  it('Tying to put into an empty MVar returns true', () => {
    const prop = checkForall(
      integer,
      x => MVar.newEmpty().tryPut(x)
    )
    expect(prop).toBe(true)
  })

  it('Trying to put into a full MVar returns false', () => {
    const prop = checkForall(
      integer,
      integer,
      (x, y) => !MVar.new(x).tryPut(y)
    )
    expect(prop).toBe(true)
  })
})

describe('MVar.put', () => {
  it('Putting into an empty MVar sets the contents of the MVar', () => {
    const prop = checkForall(
      integer,
      x => {
        const mv = MVar.newEmpty()
        mv.put(x)
        return mv.tryTake() === x
      }
    )
    expect(prop).toBe(true)
  })

  it('After putting into an empty MVar it is full', () => {
    const prop = checkForall(
      integer,
      x => {
        const mv = MVar.newEmpty()
        mv.put(x)
        return !mv.isEmpty()
      }
    )
    expect(prop).toBe(true)
  })

  it('Putting queues the value for later consmuption if the MVar is currently full', async () => {
    const prop = await checkForall(
      integer,
      integer,
      async (x, y) => {
        const mv = MVar.new(x)
        mv.put(y)
        await mv.take()
        return y === await mv.take()
      }
    )
    expect(prop).toBe(true)
  })
})

describe('MVar.take', () => {
  it('Taking calls the continuation with the current value', async () => {
    const prop = await checkForall(
      integer,
      async x => {
        const mv = MVar.new(x)
        return x === await mv.take()
      }
    )
    expect(prop).toBe(true)
  })

  it('Taking buffers the continuation until the MVar becomes full', async () => {
    const prop = await checkForall(
      integer,
      async x => {
        const mv = MVar.newEmpty()
        const promise = mv.take()
        mv.put(x)
        return x === await promise
      }
    )
    expect(prop).toBe(true)
  })

  it('Taking an empty MVar does not call the continuation', () => {
    expect.assertions(0)
    const promise = MVar.newEmpty().take()
    expect(promise).resolves.toBe(expect.anything)
    expect(promise).rejects.toBe(expect.anything)
  })

  it('After taking the MVar is empty', async () => {
    const prop = await checkForall(
      integer,
      async x => {
        const mv = MVar.new(x)
        await mv.take()
        return mv.isEmpty()
      }
    )
    expect(prop).toBe(true)
  })
})

describe('MVar.read', () => {
  it('Reading calls the continuation with the current value', async () => {
    const prop = await checkForall(
      integer,
      async x => x === await MVar.new(x).read()
    )
    expect(prop).toBe(true)
  })

  it('Reading buffers the continuation until the MVar becomes full', async () => {
    const prop = await checkForall(
      integer,
      async x => {
        const mv = MVar.newEmpty()
        const promise = mv.read()
        mv.put(x)
        return x === await promise
      }
    )
    expect(prop).toBe(true)
  })

  it('After reading the MVar remains full', async () => {
    const prop = await checkForall(
      integer,
      async x => {
        const mv = MVar.new(x)
        await mv.read()
        return !mv.isEmpty()
      }
    )
    expect(prop).toBe(true)
  })
})

describe('MVar.swap', () => {
  it('Swapping alters the contents of the MVar', async () => {
    const prop = await checkForall(
      integer,
      integer,
      async (x, y) => {
        const mv = MVar.new(x)
        await mv.swap(y)
        return y === await mv.take()
      }
    )
    expect(prop).toBe(true)
  })

  it('Swapping calls the continuation with the current value', async () => {
    const prop = await checkForall(
      integer,
      integer,
      async (x, y) => {
        const mv = MVar.new(x)
        return x === await mv.swap(y)
      }
    )
    expect(prop).toBe(true)
  })

  it('Swapping buffers the continuation until the MVar becomes full', async () => {
    const prop = await checkForall(
      integer,
      integer,
      async (x, y) => {
        const mv = MVar.newEmpty()
        const promise = mv.swap(y)
        mv.put(x)
        return x === await promise
      }
    )
    expect(prop).toBe(true)
  })
})
