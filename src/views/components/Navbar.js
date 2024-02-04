let Navbar = {
    render: async () => {
        let view =  /*html*/`

                            <a class="navbar-item" href="/#/">
                                Home
                            </a> | 
                            <a class="navbar-item" href="/#/about">
                                About
                            </a> | 
                            <a class="navbar-item" href="/#/secret">
                                Secret
                            </a> | 
                            <a class="button is-primary" href="/#/register">
                            <strong>Sign up</strong>
                        </a> | 
                        <a class="button is-light">
                            Log in
                        </a>


        `
        return view
    },
    after_render: async () => { }

}

export default Navbar;
