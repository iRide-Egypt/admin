import { addLocaleData } from 'react-intl';
import enLang from './entries/en-US';
import esLang from './entries/es-ES';
import arLang from './entries/ar_AR';

const AppLocale = {
    en: enLang,
    ar: arLang
};
addLocaleData(AppLocale.en.data);
addLocaleData(AppLocale.ar.data);

export default AppLocale;
