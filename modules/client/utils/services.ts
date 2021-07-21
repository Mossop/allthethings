import { useMemo, useEffect, useState } from "react";

import type { ReactResult, RefetchQueries } from "./types";

export type ServiceFields = string;

export interface ServiceItemProps {
  fields: ServiceFields;
  refetchQueries: () => RefetchQueries;
}

export interface ClientService {
  readonly serverId: string;
  readonly name: string;

  readonly renderServiceSettingsPageList?: () => ReactResult;
  readonly renderServiceSettingsPage?: (page: string) => ReactResult;
  readonly renderItem: (itemProps: ServiceItemProps) => ReactResult;
}

export function useServices(): ClientService[] {
  let [services, setServices] = useState(ServiceManager.getServices());

  useEffect(() => {
    return ServiceManager.listen(() => {
      setServices(ServiceManager.getServices());
    });
  }, []);

  return services;
}

export function useService(id: string): ClientService | null {
  let services = useServices();

  return useMemo(() => {
    for (let service of services) {
      if (service.serverId == id) {
        return service;
      }
    }

    return null;
  }, [services, id]);
}

export interface ClientServiceManager {
  registerService: (serviceExport: ClientService) => Promise<void>;
}

class ServiceManagerImpl implements ClientServiceManager {
  private services: Map<string, ClientService> = new Map();
  private listeners: Set<(service: ClientService) => void> = new Set();
  private staticServices: ClientService[] | null = null;

  public listen(listener: (service: ClientService) => void): () => void {
    this.listeners.add(listener);

    return () => this.listeners.delete(listener);
  }

  public getServices(): ClientService[] {
    if (!this.staticServices) {
      this.staticServices = [...this.services.values()];
    }
    return this.staticServices;
  }

  public async registerService(service: ClientService): Promise<void> {
    this.services.set(service.serverId, service);
    this.staticServices = null;

    for (let listener of this.listeners) {
      listener(service);
    }
  }
}

export const ServiceManager = new ServiceManagerImpl();
