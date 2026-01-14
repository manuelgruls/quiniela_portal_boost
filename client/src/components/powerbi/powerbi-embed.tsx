import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3 } from 'lucide-react';
import { apiRequest } from '../../lib/queryClient';
import * as pbi from 'powerbi-client';
import { service, factories } from 'powerbi-client';

interface PowerBIEmbedProps {
  pageId: string;
  showFilterPane?: boolean;
}

export default function PowerBIEmbed({ pageId, showFilterPane = false }: PowerBIEmbedProps) {
  const embedRef = useRef<HTMLDivElement>(null);
  const [embedInstance, setEmbedInstance] = useState<any>(null);
  const [powerbiService] = useState(() => new service.Service(
    factories.hpmFactory,
    factories.wpmpFactory,
    factories.routerFactory
  ));

  const { data: embedConfig, isLoading, error } = useQuery({
    queryKey: ['/api/powerbi/embed', pageId],
    queryFn: async () => {
      const response = await apiRequest('POST', '/api/powerbi/embed', { pageId });
      return response.json();
    },
    enabled: !!pageId,
    refetchInterval: 55 * 60 * 1000,
  });

  useEffect(() => {
    if (!embedConfig || !embedRef.current) return;

    initializeEmbed();

    return () => {
      if (embedInstance) {
        try {
          embedInstance.off('loaded');
          embedInstance.off('error');
        } catch (e) { console.error(e); }
      }
    };
  }, [embedConfig]);

  const initializeEmbed = () => {
    if (!embedRef.current || !embedConfig) return;

    const models = pbi.models;

    const config = {
      type: 'report',
      id: embedConfig.reportId,
      embedUrl: embedConfig.embedUrl,
      accessToken: embedConfig.accessToken,
      tokenType: models.TokenType.Embed,
      settings: {
        filterPaneEnabled: showFilterPane,
        navContentPaneEnabled: true,
        background: models.BackgroundType.Transparent,
        layoutType: models.LayoutType.MobilePortrait,
      },
    };

    try {
      if (powerbiService && embedRef.current) {
        try {
          const existingReport = powerbiService.get(embedRef.current);
          if (existingReport) {
            existingReport.off('loaded');
            existingReport.off('error');
          }
        } catch (e) {
          // Report doesn't exist, that's fine
        }
      }

      const report = powerbiService.embed(embedRef.current, config);

      report.on('error', (event: any) => {
        console.error('Power BI embed error:', event.detail);
      });

      setEmbedInstance(report);
    } catch (error) {
      console.error('Error embedding Power BI report:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium mb-2">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 mx-auto mb-4 flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-destructive" />
          </div>
          <p className="text-lg font-medium mb-2">Error al cargar el dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full" data-testid="powerbi-embed-container">
      <div ref={embedRef} className="w-full h-full" />
    </div>
  );
}
