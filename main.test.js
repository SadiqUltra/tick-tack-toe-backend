import {createHttpLink} from "apollo-link-http";
import {ApolloClient} from "apollo-client";
import {InMemoryCache} from "apollo-cache-inmemory";
import fetch from 'node-fetch'
import gql from "graphql-tag";
import {graphqlApiEndPoint} from "./constants";


const client = new ApolloClient({
    link: createHttpLink({
        uri: graphqlApiEndPoint,
        fetch: fetch
    }),
    cache: new InMemoryCache(),
    defaultOptions: {
        query: {
            fetchPolicy: 'no-cache',
            errorPolicy: 'all',
        },
    }
})

const getAllSteps = (key) => {
    return client.query({
        query: gql`
            {
                step(where: {key: {_eq:  "${key}"}}) {
                    message
                    c
                    r
                    step_no
                    timestamp
                    xo
                }
            }
        `
    })
    .then(res => {
        return res.data.step
    })
}

const insertStep = (key, message, c,r, xo, step_no) => {
    return client.mutate({
        mutation: gql`
            mutation AddStep{
                insert_step(objects: {
                    key: "${key}",
                    message: "${message}",
                    c: "${c}",
                    r: "${r}",
                    step_no: "${step_no}",
                    xo: "${xo}"
                }) {
                    affected_rows
                }
            }
        `
    })
}



const getAllLogs = (key) => {

    return client.query({
        query: gql`
            {
                step(where: {key: {_eq: "${key}"}}) {
                    message
                    timestamp
                }
            }
        `
    })
    .then(res => {
        return res.data.step
    })
}


const key = Math.random().toString(36).substring(2) + Date.now()

test('Insert Step', () => {
    return insertStep(key, "Player 1 put X on column:2, row:1", 2,1, "X", 1).then(res => {
        expect(res.data.insert_step.affected_rows).toBe(1);
    });
});

test('All Steps', () => {
    return getAllSteps(key).then(res => {
        expect(res.length > 0).toBe(true);
    });
});


test('All Logs', () => {
    return getAllLogs(key).then(res => {
        expect(res.length > 0).toBe(true);
    });
});