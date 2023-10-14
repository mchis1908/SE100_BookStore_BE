const emailContentProvider = ({ title, children }: { title: string; children: string }) => {
    return `
        <div style="border: 1px solid lightgray; padding: 1rem; border-radius: 4px">
            <img
                src="https://res.cloudinary.com/dnqytkszf/image/upload/v1697217663/BOOKSTORE/file_b1ktsi.png"
                alt="Bookstore"
                width="60"
                height="60"
            />
            <h1>${title}</h1>
            ${children}
            <p>Thanks,</p>
            <p>Bookstore</p>
        </div>
    `
}

export default emailContentProvider
