import React from "react"
import styles from "../css/platform.module.css"


class CloneElement extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      clone: props.clone,
      text: props.clone.url,
      go_button: "none",
      delete_button: "none",
    }

    this.onEnter = this.onEnter.bind(this)
    this.onLeave = this.onLeave.bind(this)
  }

  render() {
    return (
      <div>
        <div className={styles.cloneElement} onMouseEnter={this.onEnter} onMouseLeave={this.onLeave}>
          <div className={styles.cloneText}>
            <div>{this.state.text}</div>
            <a href={this.state.clone.url} id="go_button" style={{ display: this.state.go_button }} className={styles.button}>Перейти</a>
            <div id="delete_button" style={{ display: this.state.delete_button }} className={styles.buttonRed} onClick={() => this.props.onCloneDelete(this.state.clone.id)}>Удалить</div>
          </div>

          <div className={styles.cloneBack} style={{ background: `linear-gradient(0deg, rgba(11, 12, 22, 0.40) 0%, rgba(11, 12, 22, 0.40) 100%), url(data:image/jpeg;base64,${this.state.clone.picture})`, backgroundSize: "cover" }}></div>
        </div>
      </div>

    )
  }

  onEnter(event) {

    this.setState({ text: this.state.clone.reason })
    this.setState({ go_button: "flex" })
    this.setState({ delete_button: "flex" })
  }

  onLeave(event) {
    this.setState({ text: this.state.clone.url })
    this.setState({ go_button: "none" })
    this.setState({ delete_button: "none" })
  }




}

export default CloneElement









