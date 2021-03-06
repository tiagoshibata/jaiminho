import { ILocation } from '../../common/model'
import { IComponents } from '../..'
import { OrderStatus } from '../../orders/model'
import { AnalysisOptions } from 'aws-sdk/clients/cloudsearch'

export interface IDelivery {
  id: string
  carrierId: string,
  orders: string[],
  status: string,
  origin: ILocation,
  destination: ILocation,
  createdAt: string,
 }

export const deliveryAllocated = async (delivery: IDelivery, components: IComponents) => {
  const updateOrders = await components.models.getModels().order.update({
    status: OrderStatus.ALLOCATED,
    deliveryId: delivery.id,
  } as any, {
    where: {
      id: {
        $in: delivery.orders,
      },
    },
  })
}

export const deliveryClosed = async (delivery: IDelivery, components: IComponents) => {
  return components.postgres.getConnection().transaction(async (transaction) => {
    await components.models.getModels().delivery.insertOrUpdate({
      status: OrderStatus.CLOSED,
      carrierId: delivery.carrierId,
    }, {transaction})
    await components.models.getModels().order.update({
      status: OrderStatus.CLOSED,
      carrierId: delivery.carrierId,
      deliveryId: delivery.id,
    }, {
      where: {
        id: {
          $in: delivery.orders,
        },
      },
      transaction,
    })
  })
}
