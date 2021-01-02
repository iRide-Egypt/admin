import React from 'react';
import { Redirect, Route, Switch,HashRouter } from 'react-router-dom';

import defaultDash from './default';
import contentDash from './content';
import analyticsDash from './analytics';
import ecommerceDash from './ecommerce';

const Dashboards = ({ match }) => (
    <div className="dashboard-wrapper">
        <HashRouter>
            <Redirect exact from={`${match.url}/`} to={`${match.url}/default`} />
            <Route path={`${match.url}/default`} component={defaultDash} />
            <Route path={`${match.url}/content`} component={contentDash} />
            <Route path={`${match.url}/ecommerce`} component={ecommerceDash} />
            <Route path={`${match.url}/analytics`} component={analyticsDash} />
            <Redirect to="/error" />

        </HashRouter>
    </div>
);
export default Dashboards;