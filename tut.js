var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* App */
class App extends React.Component {
    constructor(args) {
        super(args);

        // Assign unique IDs to the emails
        const emails = this.props.emails;
        let id = 0;
        for (const email of emails) {
            email.id = id++;
        }

        this.state = {
            selectedEmailId: 0,
            currentSection: 'inbox',
            emails
        };
    }

    openEmail(id) {
        const emails = this.state.emails;
        const index = emails.findIndex((x) => x.id === id);
        emails[index].read = 'true';
        this.setState({
            selectedEmailId: id,
            emails
        });
    }

    deleteMessage(id) {
        // Mark the message as 'deleted'
        const emails = this.state.emails;
        const index = emails.findIndex((x) => x.id === id);
        emails[index].tag = 'deleted';

        // Select the next message in the list
        let selectedEmailId = '';
        for (const email of emails) {
            if (email.tag === this.state.currentSection) {
                selectedEmailId = email.id;
                break;
            }
        }

        this.setState({
            emails,
            selectedEmailId
        });
    }

    setSidebarSection(section) {
        let selectedEmailId = this.state.selectedEmailId;
        if (section !== this.state.currentSection) {
            selectedEmailId = '';
        }

        this.setState({
            currentSection: section,
            selectedEmailId
        });
    }

    render() {
        const currentEmail = this.state.emails.find((x) => x.id === this.state.selectedEmailId);
        return (
            <div>
                <Sidebar
                    emails={this.props.emails}
                    setSidebarSection={(section) => {
                        this.setSidebarSection(section);
                    }}
                />
                <div className="inbox-container">
                    <EmailList
                        emails={this.state.emails.filter((x) => x.tag === this.state.currentSection)}
                        onEmailSelected={(id) => {
                            this.openEmail(id);
                        }}
                        selectedEmailId={this.state.selectedEmailId}
                        currentSection={this.state.currentSection}
                    />
                    <EmailDetails
                        email={currentEmail}
                        onDelete={(id) => {
                            this.deleteMessage(id);
                        }}
                    />
                </div>
            </div>
        );
    }
}

/* Sidebar */
const Sidebar = ({ emails, setSidebarSection }) => {
    var unreadCount = emails.reduce(
        function (previous, msg) {
            if (msg.read !== 'true') {
                return previous + 1;
            } else {
                return previous;
            }
        }.bind(this),
        0
    );

    var deletedCount = emails.reduce(
        function (previous, msg) {
            if (msg.tag === 'deleted') {
                return previous + 1;
            } else {
                return previous;
            }
        }.bind(this),
        0
    );

    return (
        <div id="sidebar">
            <div className="sidebar__compose">
                <a href="#" className="btn compose">
                    Compose <span className="fa fa-pencil"></span>
                </a>
            </div>
            <ul className="sidebar__inboxes">
                <li
                    onClick={() => {
                        setSidebarSection('inbox');
                    }}
                >
                    <a>
                        <span className="fa fa-inbox"></span> Inbox
                        <span className="item-count">{unreadCount}</span>
                    </a>
                </li>
                <li
                    onClick={() => {
                        setSidebarSection('sent');
                    }}
                >
                    <a>
                        <span className="fa fa-paper-plane"></span> Sent
                        <span className="item-count">0</span>
                    </a>
                </li>
                <li
                    onClick={() => {
                        setSidebarSection('drafts');
                    }}
                >
                    <a>
                        <span className="fa fa-pencil-square-o"></span> Drafts
                        <span className="item-count">0</span>
                    </a>
                </li>
                <li
                    onClick={() => {
                        setSidebarSection('deleted');
                    }}
                >
                    <a>
                        <span className="fa fa-trash-o"></span> Trash
                        <span className="item-count">{deletedCount}</span>
                    </a>
                </li>
            </ul>
        </div>
    );
};

/* Email classes */
const EmailListItem = ({ email, onEmailClicked, selected }) => {
    let classes = 'email-item';
    if (selected) {
        classes += ' selected';
    }

    return (
        <div
            onClick={() => {
                onEmailClicked(email.id);
            }}
            className={classes}
        >
            <div className="email-item__unread-dot" data-read={email.read}></div>
            <div className="email-item__subject truncate">{email.subject}</div>
            <div className="email-item__details">
                <span className="email-item__from truncate">{email.from}</span>
                <span className="email-item__time truncate">{getPrettyDate(email.time)}</span>
            </div>
        </div>
    );
};

const EmailDetails = ({ email, onDelete }) => {
    if (!email) {
        return <div className="email-content empty"></div>;
    }

    const date = `${getPrettyDate(email.time)} · ${getPrettyTime(email.time)}`;

    const getDeleteButton = () => {
        if (email.tag !== 'deleted') {
            return (
                <span
                    onClick={() => {
                        onDelete(email.id);
                    }}
                    className="delete-btn fa fa-trash-o"
                ></span>
            );
        }
        return undefined;
    };

    return (
        <div className="email-content">
            <div className="email-content__header">
                <h3 className="email-content__subject">{email.subject}</h3>
                {getDeleteButton()}
                <div className="email-content__time">{date}</div>
                <div className="email-content__from">{email.from}</div>
            </div>
            <div className="email-content__message">{email.message}</div>
        </div>
    );
};

/* EmailList contains a list of Email components */
const EmailList = ({ emails, onEmailSelected, selectedEmailId }) => {
    if (emails.length === 0) {
        return <div className="email-list empty">Nothing to see here, great job!</div>;
    }

    return (
        <div className="email-list">
            {emails.map((email) => {
                return (
                    <EmailListItem
                        onEmailClicked={(id) => {
                            onEmailSelected(id);
                        }}
                        email={email}
                        selected={selectedEmailId === email.id}
                    />
                );
            })}
        </div>
    );
};

// Render
$.ajax({
    url: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/311743/dummy-emails.json',
    type: 'GET',
    success: function (result) {
        React.render(<App emails={result} />, document.getElementById('inbox'));
    }
});

// Helper methods
const getPrettyDate = (date) => {
    date = date.split(' ')[0];
    const newDate = date.split('-');
    const month = months[0];
    return `${month} ${newDate[2]}, ${newDate[0]}`;
};

// Remove the seconds from the time
const getPrettyTime = (date) => {
    const time = date.split(' ')[1].split(':');
    return `${time[0]}:${time[1]}`;
};
