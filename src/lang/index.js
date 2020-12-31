import { addLocaleData } from 'react-intl';
import enLang from './entries/en-US';
import esLang from './entries/es-ES';
import arLang from './entries/ar_AR';

const AppLocale = {
    en: enLang,
    es: esLang,
    ar: arLang
};
addLocaleData(AppLocale.en.data);
addLocaleData(AppLocale.es.data);
addLocaleData(AppLocale.ar.data);

export default AppLocale;
