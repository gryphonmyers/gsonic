<template>
    <v-form @submit="submitForm">
        <v-card>
            <v-card-title>
                Log in
            </v-card-title>
            <v-card-text>
                <v-text-field name="host" label="Host"/>
                <v-text-field name="username" label="Username"/>
                <v-text-field name="password" label="Password" type="password"/>
            </v-card-text>
            <v-card-actions>
                <v-btn type="submit">Submit</v-btn>
            </v-card-actions>
        </v-card>
<!--     
form.auth-form(onsubmit=locals.$bind("this.submitForm(event.target)", {preventDefault: true}))
    MaterialTextField#auth-server(placeholder="http://myserver.com/", label="Server", onchange=locals.$bindValue("server"))
    MaterialTextField#auth-user(placeholder="My Username", label="User", onchange=locals.$bindValue("user"))
    MaterialTextField#auth-password(type="password", placeholder="My Password", label="Password", onchange=locals.$bindValue("password"))
    MaterialSelectionControl#auth-remember(type="switch", label="Remember me?", onchange=locals.$bindValue("shouldRemember"))
    MaterialButton Submit -->
    </v-form>
</template>

<script>
export default {
    data() {
        return {
            
        }
    },
    methods: {
        async submitForm(event) {
            event.preventDefault();
            const data = new FormData(event.target);
            await this.$store.dispatch('createInterface', { username: data.get('username'), password: data.get('password'), host: data.get('host'), })
            

                // .then(token => {
                //     this.trigger('createlibraryinterface', {libraryInterface, shouldRemember: this.state.shouldRemember === 'on'});
                // });
            debugger;
        }
    }
}
</script>
