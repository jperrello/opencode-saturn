import { Log } from "@/util/log"
import { Bonjour } from "bonjour-service"
import { createSaturn, getEffectiveEndpoint as _getEffectiveEndpoint, type DiscoveredService as _DiscoveredService } from "ai-sdk-provider-saturn"
import { sortBy } from "remeda"

const log = Log.create({ service: "mdns" })

export namespace MDNS {
  const bonjour = { instance: undefined as Bonjour | undefined, port: undefined as number | undefined }

  const saturn = {
    sdk: null as ReturnType<typeof createSaturn> | null,
    ready: false,
  }

  export function publish(port: number) {
    if (bonjour.port === port) return
    if (bonjour.instance) unpublish()

    try {
      const name = `opencode-${port}`
      bonjour.instance = new Bonjour()
      const svc = bonjour.instance.publish({
        name,
        type: "http",
        host: "opencode.local",
        port,
        txt: { path: "/" },
      })

      svc.on("up", () => {
        log.info("mDNS service published", { name, port })
      })

      svc.on("error", (err) => {
        log.error("mDNS service error", { error: err })
      })

      bonjour.port = port
    } catch (err) {
      log.error("mDNS publish failed", { error: err })
      if (bonjour.instance) {
        try {
          bonjour.instance.destroy()
        } catch {}
      }
      bonjour.instance = undefined
      bonjour.port = undefined
    }
  }

  export function unpublish() {
    if (!bonjour.instance) return
    try {
      bonjour.instance.unpublishAll()
      bonjour.instance.destroy()
    } catch (err) {
      log.error("mDNS unpublish failed", { error: err })
    }
    bonjour.instance = undefined
    bonjour.port = undefined
    log.info("mDNS service unpublished")
  }

  export async function discover(options: {
    onServiceDiscovered?: (service: DiscoveredService) => void
    onServiceRemoved?: (name: string) => void
    timeout?: number
  }): Promise<DiscoveredService[]> {
    const timeout = options.timeout ?? 3000

    const logger = {
      log(level: "debug" | "info" | "warn" | "error", message: string, data?: Record<string, unknown>) {
        log[level](message, data)
      },
    }

    if (!saturn.sdk) {
      saturn.ready = false
      saturn.sdk = createSaturn({
        discoveryTimeout: timeout,
        logger,
        onServiceDiscovered: async (svc: DiscoveredService) => {
          if (!saturn.ready) return
          options.onServiceDiscovered?.(svc)
        },
        onServiceRemoved: async (name: string) => {
          if (!saturn.ready) return
          options.onServiceRemoved?.(name)
        },
      })
    }

    const discovery = saturn.sdk.getDiscovery()

    await new Promise<void>((resolve) => {
      const start = Date.now()
      const check = () => {
        if (Date.now() - start > timeout) {
          resolve()
          return
        }
        setTimeout(check, 100)
      }
      check()
    })

    if (discovery.hasServices()) {
      await discovery.fetchAllModels()
    }

    saturn.ready = true

    const found = sortBy(discovery.getAllServices(), (s) => s.priority)
    log.info("Saturn discovery complete", {
      services: found.length,
      models: found.reduce((n, s) => n + s.models.length, 0),
    })
    return found
  }

  export function services(): DiscoveredService[] {
    if (!saturn.sdk) return []
    return saturn.sdk.getDiscovery().getAllServices()
  }

  export function service(name: string): DiscoveredService | undefined {
    if (!saturn.sdk) return undefined
    return saturn.sdk.getDiscovery().getAllServices().find((s) => s.name === name)
  }

  export async function fetchModels(): Promise<void> {
    if (!saturn.sdk) return
    const discovery = saturn.sdk.getDiscovery()
    if (discovery.hasServices()) {
      await discovery.fetchAllModels()
    }
  }

  export async function fetchModelsFor(name: string): Promise<boolean> {
    if (!saturn.sdk) return false
    return saturn.sdk.getDiscovery().fetchModelsForServiceByName(name)
  }

  export function model(id: string) {
    if (!saturn.sdk) throw new Error("Saturn discovery not initialized")
    return saturn.sdk.languageModel(id)
  }

  export function destroy() {
    if (!saturn.sdk) return
    log.info("disposing Saturn SDK")
    saturn.sdk.destroy()
    saturn.sdk = null
    saturn.ready = false
  }

  export const getEffectiveEndpoint = _getEffectiveEndpoint
  export type DiscoveredService = _DiscoveredService
}
