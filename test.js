const axios = require('axios');

const fedServices = {
    parseUsername: function (username){
        return username.split('*');
    },
    checkFedStatus: function (username){
        var username = this.parseUsername(username)[0]
        var server = this.parseUsername(username)[1]
        axios.get('https://' + server + '/federationStatus')
          .then(function (response) {
            return response.data
          })
          .catch(function (error) {
            return error
          });
    },
    pushDataToServer: function (data, user){
        if (this.checkFedStatus(user) == false){
            console.log("fedstatusfail")
            return {err: "SERVER_DOESNT_ACCEPT_FEDERATION"}
        }
        var username = this.parseUsername(user)[0]
        var server = this.parseUsername(user)[1]
        var bodyFormData = new FormData();
        bodyFormData.append('deliverTo', username);
        bodyFormData.append('data', data);

        axios.post({url: 'https://' + server + '/postData', headers: { "Content-Type": "multipart/form-data" }, data: bodyFormData})
          .then(function (response) {
            console.log(response.data)
            return response.data
          })
          .catch(function (error) {
            console.log(error)
            return error
          });
    },
    queryAcceptanceStatus: function (user, id){
        if (this.checkFedStatus(user) == false){
            return {err: "SERVER_DOESNT_ACCEPT_FEDERATION"}
        }
        var username = this.parseUsername(user)[0]
        var server = this.parseUsername(user)[1]
        axios.get('https://' + server + '/acceptanceStatus', {
            params: {
                id: id
            }
          })
          .then(function (response) {
            return response.data
          })
          .catch(function (error) {
            return error
          });
    }
}

if(fedServices.parseUsername('6d6cdc86-d604-4b56-8edd-7fbd35719ede*xb45aa.deta.dev')[1] != null){
    console.log(fedServices.pushDataToServer('test2', '6d6cdc86-d604-4b56-8edd-7fbd35719ede*xb45aa.deta.dev'))
}