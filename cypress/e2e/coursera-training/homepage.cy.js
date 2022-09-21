/// <reference types='cypress' />

describe("Verify Conduct add article feature", () => {

    beforeEach(() => {
        let res;
        cy.request({
            method: 'POST',
            url: 'http://localhost:3000/api/users/login',
            body: {
                "user": {
                    "email": "fuad@test.com",
                    "password": "testing123"
                }
            }
        }).then(response => {
            res = response
        })
        cy.visit("http://localhost:3000", {
            onBeforeLoad(win) {
                win.localStorage.setItem('user', JSON.stringify(res.body.user))
            }
        })
    })

    it('Intercept GET tags call', () => {
        cy.intercept({
            method: 'GET',
            url: "**/api/tags"
        }, {
            fixture: "tags.json"
        })
        cy.reload()
        cy.get('.tag-list')
            .should('contain', 'cypress')
            .and('contain', 'selenium')
            .and('contain', 'katalon')
    })

    it("Add article and update the request", () => {
        cy.intercept({
                method: 'POST',
                url: "**/api/articles"
            }, (req) => {
                req.body.article.description = "This is a request description"
            }
        ).as("postArticle")

        cy.contains('New Article').click()
        cy.get('[placeholder="Article Title"]').type('Article on cypress')
        cy.get('[placeholder="What\'s this article about?"]').type('Cypress')
        cy.get('[placeholder="Write your article (in markdown)"]').type('Cypress')
        cy.get('[placeholder-"Enter tags"]').type('Test Automation').type('{enter}')
        cy.get('button[type="button"]').click()

        cy.wait("@postArticle")

        cy.get("@postArticle").then(xhr => {
            console.log(xhr)
            expect(xhr.response.statusCode).to.equal(200)
            expect(xhr.request.body.article.description).to.equal("This is a request description")
        })
    })

    it("Add article and update the response", () => {
        cy.intercept({
            method: 'POST',
            url: "**/api/articles"
        }, (req) => {
            req.reply(res => {
                res.body.article.description = "This is a response description"
            })
        }).as("postArticle")

        cy.contains('New Article').click()
        cy.get('[placeholder="Article Title"]').type('Article on cypress')
        cy.get('[placeholder="What\'s this article about?"]').type('Cypress')
        cy.get('[placeholder="Write your article (in markdown)"]').type('Cypress')
        cy.get('[placeholder-"Enter tags"]').type('Test Automation').type('{enter}')
        cy.get('button[type="button"]').click()

        cy.wait("@postArticle")

        cy.get("@postArticle").then(xhr => {
            console.log(xhr)
            expect(xhr.response.statusCode).to.equal(200)
            expect(xhr.response.body.article.description).to.equal("This is a response description")
        })
    })

})