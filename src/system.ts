import { routes } from './routes'
import { IComponents } from './index'
import { PostgresComponent } from './components/postgres'
import { IComponentMap, System } from './components/system'
import { ConfigComponent, ENV } from './components/config'
import { ExpressService } from './components/service'
import { ModelsComponent } from './components/models'
import { modelDescriptionMap } from './models'
import { HttpClient } from './components/http'
import { DistanceApi } from './components/distance-api'
import * as googleDistance from 'google-distance'
import { S3Component } from './components/s3'
import * as AWS from 'aws-sdk'
import { TokenComponent } from './components/token'
import { ConsumerComponent } from './components/consumer'
import { deliveryTopicConfigMap } from './deliveries/diplomat/consumer'

const componentMap: IComponentMap = {
  postgres: {
    instance: new PostgresComponent(),
    dependenciesList: ['config'],
  },
  config: {
    instance: new ConfigComponent(ENV.dev),
    dependenciesList: [],
  },
  service: {
    instance: new ExpressService(routes),
    dependenciesList: ['config', 'postgres', 'models', 'http', 'distanceService', 's3', 'token'],
  },
  models: {
    instance: new ModelsComponent(modelDescriptionMap),
    dependenciesList: ['postgres'],
  },
  http: {
    instance: new HttpClient(),
    dependenciesList: ['config'],
  },
  distanceService: {
    instance: new DistanceApi(googleDistance),
    dependenciesList: ['config'],
  },
  s3: {
    instance: new S3Component(new AWS.S3()),
    dependenciesList: [],
  },
  token: {
    instance: new TokenComponent(),
    dependenciesList: ['config', 's3'],
  },
  consumer: {
    instance: new ConsumerComponent(new AWS.SQS({
      region: 'us-east-1',
    }), deliveryTopicConfigMap),
    dependenciesList: [],
  },
}

export const system = new System<IComponents>(componentMap)