import React from "react"
import Header from "../components/Header"
import Footer from "../components/Footer"
import Virus from "../components/Virus"
import styles from "../css/platform.module.css"
import "../css/main.css"
import EmptySiteElement from "../components/EmptySiteElement"
import SiteElement from "../components/SiteElement"
import EmptySite from "./EmptySite"
import AddSite from "./AddSite"
import PlaceholderSiteElement from "./PlaceholderSiteElement"

class Sites extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selected_id: -1
    }

    this.select = this.select.bind(this)
  }

  componentDidUpdate(prevProps) {
    if (this.props.trigger !== prevProps.trigger) {
      this.select(-1);
    }
  }

  notSelectedSite = {
    padding: "10px",
    borderTop: "#fff solid 1px",
    borderLeft: "#fff solid 1px",
    borderBottom: "#fff solid 1px",
    borderRight: "#797979 solid 1px"
  }

  selectedSite = {
    padding: "10px",
    borderTop: "#797979 solid 1px",
    borderLeft: "#797979 solid 1px",
    borderBottom: "#797979 solid 1px",
    borderRight: "0",
    borderRadius: "1rem",
    borderTopRightRadius: "0",
    borderBottomRightRadius: "0",
    backgroundColor: "#CCECEB"
  }

  defaultSite = {
    padding: "10px",
    borderTop: "#fff solid 1px",
    borderLeft: "#fff solid 1px",
    borderBottom: "#fff solid 1px",
    borderRight: "#fff solid 1px"
  }

  render() {
    if (this.props.sites.length > 0) {
      return (<div>
        <EmptySiteElement isSelected={this.chooseSelectedStatus()} onSelect={this.select} openPage={this.props.openPage}></EmptySiteElement>
        {this.props.sites.map((site) => (
          <SiteElement isSelected={this.chooseSelectedStatus(site)} onSelect={this.select} openPage={this.props.openPage} site={site} key={site.id} />
        ))}
      </div>)
    }
    else {
      return (
        <div>
          <EmptySiteElement isSelected={this.chooseSelectedStatus()} onSelect={this.select} openPage={this.props.openPage}></EmptySiteElement>
          <PlaceholderSiteElement isSelected={this.chooseSelectedStatus({ id: 1 })} />
        </div>

      )
    }

  }

  select(site_id) {
    console.log(site_id)
    this.setState({ selected_id: site_id })
    this.props.openPage(site_id)
  }

  chooseSelectedStatus(site = { id: 0 }) {
    switch (this.state.selected_id) {
      case -1:
        return this.defaultSite
      case site.id:
        return this.selectedSite
      default:
        return this.notSelectedSite
    }
  }

}

export default Sites