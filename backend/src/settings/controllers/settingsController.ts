import { NextFunction, Response } from 'express';
import { AuthRequest } from '../../common/types';
import { mapDocument, normalizeDocument } from '../../common/utils';
import { BusinessSettings } from '../models/BusinessSettings';

async function getOrCreateSettings(req: AuthRequest): Promise<any> {
  let settings = await BusinessSettings.findOne({ businessId: req.businessId });
  if (!settings) {
    settings = await BusinessSettings.create({
      businessId: req.businessId,
      createdByUserId: req.user?.id,
      updatedByUserId: req.user?.id,
      source: 'system',
    });
  }
  return settings;
}

export async function getSettingsHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const settings = await getOrCreateSettings(req);
    res.json({ data: mapDocument(normalizeDocument(settings)) });
  } catch (error) {
    next(error);
  }
}

export async function updateSettingsHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const settings = await getOrCreateSettings(req);

    settings.businessType = typeof req.body.businessType === 'string' ? req.body.businessType : settings.businessType;
    settings.forecastHorizonDays = typeof req.body.forecastHorizonDays === 'number' ? req.body.forecastHorizonDays : settings.forecastHorizonDays;
    settings.safetyFactor = typeof req.body.safetyFactor === 'number' ? req.body.safetyFactor : settings.safetyFactor;
    settings.preferredUnits = Array.isArray(req.body.preferredUnits) ? req.body.preferredUnits.filter((value) => typeof value === 'string') : settings.preferredUnits;
    settings.notificationThresholds = {
      lowStockWarningDays:
        typeof req.body.notificationThresholds?.lowStockWarningDays === 'number'
          ? req.body.notificationThresholds.lowStockWarningDays
          : settings.notificationThresholds.lowStockWarningDays,
      lowStockCriticalDays:
        typeof req.body.notificationThresholds?.lowStockCriticalDays === 'number'
          ? req.body.notificationThresholds.lowStockCriticalDays
          : settings.notificationThresholds.lowStockCriticalDays,
    };
    settings.updatedByUserId = req.user?.id;
    settings.source = 'manual';

    await settings.save();
    res.json({ data: mapDocument(normalizeDocument(settings)) });
  } catch (error) {
    next(error);
  }
}
