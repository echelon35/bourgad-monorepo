import { Controller, HttpCode, Logger, Param, Post } from '@nestjs/common';
import { WikimancheIngestionService } from './wikimanche-ingestion.service';

@Controller('admin/wikimanche')
export class WikimancheIngestionController {
  private readonly logger = new Logger(WikimancheIngestionController.name);

  constructor(private readonly ingestionService: WikimancheIngestionService) {}

  @Post('ingest/full')
  @HttpCode(202)
  async triggerFullIngestion(): Promise<{ message: string }> {
    this.logger.log('Ingestion complète déclenchée manuellement');
    // Fire-and-forget : ne pas attendre la fin pour répondre
    this.ingestionService.fullIngestion().catch(err =>
      this.logger.error(`Erreur ingestion complète: ${err}`),
    );
    return { message: 'Ingestion complète démarrée en arrière-plan' };
  }

  @Post('ingest/category/:category')
  @HttpCode(202)
  async triggerCategoryIngestion(
    @Param('category') category: string,
  ): Promise<{ message: string }> {
    this.logger.log(`Ingestion de la catégorie "${category}" déclenchée manuellement`);
    this.ingestionService.ingestCategory(decodeURIComponent(category)).catch(err =>
      this.logger.error(`Erreur ingestion catégorie "${category}": ${err}`),
    );
    return { message: `Ingestion de la catégorie "${category}" démarrée en arrière-plan` };
  }

  @Post('sync/incremental')
  @HttpCode(202)
  async triggerIncrementalSync(): Promise<{ message: string }> {
    this.logger.log('Synchronisation incrémentale déclenchée manuellement');
    this.ingestionService.incrementalSync().catch(err =>
      this.logger.error(`Erreur synchronisation incrémentale: ${err}`),
    );
    return { message: 'Synchronisation incrémentale démarrée en arrière-plan' };
  }
}
