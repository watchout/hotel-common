#!/usr/bin/env ts-node
import express from 'express'
import { HotelIntegrationServer } from '../src/server/integration-server'

type Layer = any

function extractMountPath(layer: Layer): string {
  // layer.regexp looks like /^\/api\/v1\/admin\/?(?=\/|$)/i
  const src: string | undefined = layer?.regexp?.source
  if (!src) return '/'
  try {
    const decoded = src
      .replace('^\\/', '/')
      .replace('\\/', '/')
      .replace('\\/?', '')
      .replace('(?=\\/|$)', '')
      .replace('^', '')
    return decoded
  } catch {
    return '/'
  }
}

function listTopLevelMounts(app: express.Application) {
  const stack: Layer[] = (app as any)._router?.stack || []
  const mounts = stack
    .map((layer, idx) => {
      if (layer && layer.name === 'router' && layer.regexp) {
        return { idx, type: 'router', path: extractMountPath(layer) }
      }
      if (layer && layer.route && layer.route.path) {
        return { idx, type: 'route', path: layer.route.path }
      }
      return null
    })
    .filter(Boolean) as { idx: number; type: string; path: string }[]
  return mounts
}

async function main() {
  const server: any = new HotelIntegrationServer()
  // インスタンス生成時にルートが組み込まれる（start()は呼ばない）
  const app: express.Application = server['app']
  if (!app) {
    console.error('App instance not accessible')
    process.exit(1)
  }

  const mounts = listTopLevelMounts(app)
  // 注目ルートのみ抽出
  const targets = ['/api/v1/logs', '/api/v1/admin', '/api/v1/admin/front-desk']

  console.log('=== ROUTE-DUMP (top-level mounts in order) ===')
  mounts.forEach((m) => {
    console.log(`${String(m.idx).padStart(3, ' ')}  ${m.type.padEnd(6, ' ')}  ${m.path}`)
  })

  console.log('\n=== ROUTE-DUMP (filtered) ===')
  mounts
    .filter((m) => targets.some((t) => m.path.startsWith(t)))
    .forEach((m) => console.log(`${m.idx}  ${m.type}  ${m.path}`))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})


