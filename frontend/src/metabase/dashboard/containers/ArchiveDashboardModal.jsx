/* eslint-disable react/prop-types */
import PropTypes from "prop-types";
import { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { push } from "react-router-redux";
import { t } from "ttag";
import _ from "underscore";

import ArchiveModal from "metabase/components/ArchiveModal";
import Collection from "metabase/entities/collections";
import Dashboards from "metabase/entities/dashboards";
import * as Urls from "metabase/lib/urls";

const mapDispatchToProps = {
  setDashboardArchived: Dashboards.actions.setArchived,
  push,
};

class ArchiveDashboardModal extends Component {
  static propTypes = {
    onClose: PropTypes.func,
  };

  close = () => {
    // since we need to redirect back to the parent collection when archiving
    // we have to call this here first to unmount the modal and then push to the
    // parent collection
    this.props.onClose();
    if (this.props.dashboard.archived) {
      this.props.push(Urls.collection(this.props.collection));
    }
  };

  archive = async () => {
    const dashboardId = Urls.extractEntityId(this.props.params.slug);
    await this.props.setDashboardArchived({ id: dashboardId }, true);
  };

  render() {
    const { dashboard } = this.props;
    return (
      <ArchiveModal
        title={
          dashboard.is_app_age
            ? t`Archive this page?`
            : t`Archive this dashboard?`
        }
        message={t`Are you sure you want to do this?`}
        onClose={this.close}
        onArchive={this.archive}
      />
    );
  }
}

export const ArchiveDashboardModalConnected = _.compose(
  connect(null, mapDispatchToProps),
  Dashboards.load({
    id: (state, props) => Urls.extractCollectionId(props.params.slug),
  }),
  Collection.load({
    id: (state, props) => props.dashboard && props.dashboard.collection_id,
  }),
  withRouter,
)(ArchiveDashboardModal);
