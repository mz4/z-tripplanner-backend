import { Router } from 'express'
import controllers from './trip.controllers'

const router = Router()

// /api/trip
router
  .route('/')
  .get(controllers.getMany)
  .post(controllers.createOne)

// /api/trip/:id
router
  .route('/:id')
  .get(controllers.getOne)
  .put(controllers.updateOne)
  .delete(controllers.removeOne)

export default router
