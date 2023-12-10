import React from "react"
import styles from "../css/platform.module.css"


class PlaceholderSiteElement extends React.Component {
  siteAdd = {}
  constructor(props) {
    super(props)
    this.state = {
      url: 'https://цифровой-суверенитет.рф/',
      title: 'Национальный студенческий хакатон',
      preview: '../img/screenshot.jpg',
    }
  }


  render() {
    return (
      <div style={this.props.isSelected}>
        <div className={styles.EsiteElement} style={{ border: 0, cursor: "default" }}></div>
      </div>
    )
  }


}

export default PlaceholderSiteElement









