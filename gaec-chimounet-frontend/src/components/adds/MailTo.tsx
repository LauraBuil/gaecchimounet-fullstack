import React from 'react'

interface MailToProps {
    email: string
    className?: string
}

const MailTo: React.FC<MailToProps> = ({ email, className }) => (
    <a className={className} href={`mailto:${email}`}>
        {email}
    </a>
)

export default MailTo