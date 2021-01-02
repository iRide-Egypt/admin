import React, { Component } from 'react';
import { Route, withRouter, Switch, Redirect, HashRouter } from 'react-router-dom';

import TopNav from 'Containers/TopNav'
import Sidebar from 'Containers/Sidebar';

import dashboards from './dashboards';
import layouts from './layouts';
import applications from './applications';
import ui from './ui';

import { connect } from 'react-redux';

class MainApp extends Component {
	render() {
		const { match, containerClassnames} = this.props;
		return (
			<div id="app-container" className={containerClassnames}>
				<TopNav history={this.props.history} />
				<Sidebar/>
				<main>
					<div className="container-fluid">
						<HashRouter>
							<Route path={`${match.url}/applications`} component={applications} />
							<Route path={`${match.url}/dashboards`} component={dashboards} />
							<Route path={`${match.url}/layouts`} component={layouts} />
							<Route path={`${match.url}/ui`} component={ui} />
							<Redirect to="/error" />
						</HashRouter>
					</div>
				</main>
			</div>
		);
	}
}
const mapStateToProps = ({ menu }) => {
	const { containerClassnames} = menu;
	return { containerClassnames };
  }
  
export default withRouter(connect(mapStateToProps, {})(MainApp));