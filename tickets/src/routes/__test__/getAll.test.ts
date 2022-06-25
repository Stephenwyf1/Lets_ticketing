import request from "supertest";
import {app} from  '../../app';

const createTicket = async (title:string,price:number)=>{
    return request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title, price
        });
}
it('can fetch a list of tickets', async ()=>{
    await createTicket('asdadswa',123);
    await createTicket('asddasaa',231);
    await createTicket('ad2asawa',12335);

    const response = await request(app)
        .get('/api/tickets')
        .send()
        .expect(200);
    expect(response.body.length).toEqual(3);
    // console.log(response.body);
})