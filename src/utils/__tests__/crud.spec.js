import { getOne, getMany, createOne, updateOne, removeOne } from '../crud'
import { Trip } from '../../resources/trip/trip.model'
import { User } from '../../resources/user/user.model'
import mongoose from 'mongoose'

describe('crud controllers', () => {
  describe('getOne', async () => {
    test('finds by authenticated user and id', async () => {
      expect.assertions(2)

      const user = mongoose.Types.ObjectId()
      const trip = await Trip.create({ name: 'trip', createdBy: user })

      const req = {
        params: {
          id: trip._id
        },
        user: {
          _id: user
        }
      }

      const res = {
        status(status) {
          expect(status).toBe(200)
          return this
        },
        json(result) {
          expect(result.data._id.toString()).toBe(trip._id.toString())
        }
      }

      await getOne(Trip)(req, res)
    })

    test('404 if no doc was found', async () => {
      expect.assertions(2)

      const user = mongoose.Types.ObjectId()

      const req = {
        params: {
          id: mongoose.Types.ObjectId()
        },
        user: {
          _id: user
        }
      }

      const res = {
        status(status) {
          expect(status).toBe(400)
          return this
        },
        end() {
          expect(true).toBe(true)
        }
      }

      await getOne(Trip)(req, res)
    })
  })

  describe('getMany', () => {
    test('finds array of docs by authenticated user', async () => {
      expect.assertions(4)

      const user = mongoose.Types.ObjectId()
      await Trip.create([
        { name: 'trip', createdBy: user },
        { name: 'other', createdBy: user },
        { name: 'trip', createdBy: mongoose.Types.ObjectId() }
      ])

      const req = {
        user: {
          _id: user
        }
      }

      const res = {
        status(status) {
          expect(status).toBe(200)
          return this
        },
        json(result) {
          expect(result.data).toHaveLength(2)
          result.data.forEach(doc => expect(`${doc.createdBy}`).toBe(`${user}`))
        }
      }

      await getMany(Trip)(req, res)
    })
  })

  describe('createOne', () => {
    test('creates a new doc', async () => {
      expect.assertions(2)

      const user = mongoose.Types.ObjectId()
      const body = { name: 'name' }

      const req = {
        user: { _id: user },
        body
      }

      const res = {
        status(status) {
          expect(status).toBe(201)
          return this
        },
        json(results) {
          expect(results.data.name).toBe(body.name)
        }
      }

      await createOne(Trip)(req, res)
    })

    test('createdBy should be the authenticated user', async () => {
      expect.assertions(2)

      const user = mongoose.Types.ObjectId()
      const body = { name: 'name' }

      const req = {
        user: { _id: user },
        body
      }

      const res = {
        status(status) {
          expect(status).toBe(201)
          return this
        },
        json(results) {
          expect(`${results.data.createdBy}`).toBe(`${user}`)
        }
      }

      await createOne(Trip)(req, res)
    })
  })

  describe('updateOne', () => {
    test('finds doc by authenticated user and id to update', async () => {
      expect.assertions(3)

      const user = mongoose.Types.ObjectId()
      const trip = await Trip.create({ name: 'name', createdBy: user })
      const update = { name: 'hello' }

      const req = {
        params: { id: trip._id },
        user: { _id: user },
        body: update
      }

      const res = {
        status(status) {
          expect(status).toBe(200)
          return this
        },
        json(results) {
          expect(`${results.data._id}`).toBe(`${trip._id}`)
          expect(results.data.name).toBe(update.name)
        }
      }

      await updateOne(Trip)(req, res)
    })

    test('400 if no doc', async () => {
      expect.assertions(2)

      const user = mongoose.Types.ObjectId()
      const update = { name: 'hello' }

      const req = {
        params: { id: mongoose.Types.ObjectId() },
        user: { _id: user },
        body: update
      }

      const res = {
        status(status) {
          expect(status).toBe(400)
          return this
        },
        end() {
          expect(true).toBe(true)
        }
      }

      await updateOne(Trip)(req, res)
    })
  })

  describe('removeOne', () => {
    test('first doc by authenticated user and id to remove', async () => {
      expect.assertions(2)

      const user = mongoose.Types.ObjectId()
      const trip = await Trip.create({ name: 'name', createdBy: user })

      const req = {
        params: { id: trip._id },
        user: { _id: user }
      }

      const res = {
        status(status) {
          expect(status).toBe(200)
          return this
        },
        json(results) {
          expect(`${results.data._id}`).toBe(`${trip._id}`)
        }
      }

      await removeOne(Trip)(req, res)
    })

    test('400 if no doc', async () => {
      expect.assertions(2)
      const user = mongoose.Types.ObjectId()

      const req = {
        params: { id: mongoose.Types.ObjectId() },
        user: { _id: user }
      }

      const res = {
        status(status) {
          expect(status).toBe(400)
          return this
        },
        end() {
          expect(true).toBe(true)
        }
      }

      await removeOne(Trip)(req, res)
    })
  })
})
