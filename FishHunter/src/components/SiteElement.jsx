import React from "react"
import styles from "../css/platform.module.css"


class SiteElement extends React.Component {


  render() {
    return (
      <div style={this.props.isSelected}>
        <div className={styles.siteElement} onClick={this.handleClick}>
          <div className={styles.siteBack} style={{ background: `linear-gradient(0deg, rgba(11, 12, 22, 0.40) 0%, rgba(11, 12, 22, 0.40) 100%), url(data:image/jpeg;base64,${this.props.site.preview})`, backgroundSize: "cover" }}></div>
          <div className={styles.decBorder}>
            <div className={styles.plusText}>{this.props.site.title}</div>
          </div>
        </div>
      </div>

    )
  }

  handleClick = event => {
    // this.props.openPage("")
    this.props.onSelect(this.props.site.id)
  }

}

export default SiteElement









