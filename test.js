var supertest = require("supertest");
var should = require("should");

var server = supertest.agent("http://localhost:3000");

describe("GET health",function(){

	it("status",function(done){

	server.get("/health")
		.expect(200)
	    .expect("Content-type",/json/)
		.end(function(err,res){
			// body result should be OK
			res.body.result.should.equal("OK");
			// body status should be true
			res.body.status.should.equal(true);
			done();
		});
	});
});

describe("POST checkBalances",function(){

	it("status",function(done){
		server.post("/checkBalances")
		    .send({"addr_array":["0x9d96b0561be0440ebe93e79fe06a23bbe8270f90","0x0089d53F703f7E0843953D48133f74cE247184c2"]})
			.expect(200)
			.end(function(err,res){
				// body status should be true
				res.body.status.should.equal(true);
				done();
		});
	});


	it("bad request",function(done){
		server.post("/checkBalances")
		    .send({"addr_array":"address"})
			.expect(400)
			.end(function(err,res){
			done();
		});
	});

	it("response length",function(done){

		server.post("/checkBalances")
		    .send({"addr_array":["0x9d96b0561be0440ebe93e79fe06a23bbe8270f90","0x0089d53F703f7E0843953D48133f74cE247184c2","0xb5d85CBf7cB3EE0D56b3bB207D5Fc4B82f43F511"]})
			.expect(200)
			.end(function(err,res){
				// body status should be true
				res.body.status.should.equal(true);
				// Check length
				res.body.result.length.should.equal(3);
				done();
		});
	});

	it("address validity",function(done){

		server.post("/checkBalances")
		    .send({"addr_array":["0x9d96b0561be0440ebe93e79fe06a23bbe8270f90","0XX0089d53F703f7E0843953D48133f74cE247184c2"]})
			.expect(200)
			.end(function(err,res){
				// Valid
				res.body.status.should.equal(true);
				res.body.result[0].balance.should.equal(667.8601811724393);
				res.body.result[0].addressIsValid.should.equal(true);
				// Invalid
				res.body.result[1].balance.should.equal(-1);
				res.body.result[1].addressIsValid.should.equal(false);
				done();
		});
	});

	it("request validity",function(done){

		server.post("/checkBalances")
		    .send({"addr_array":["0x9d96b0561be0440ebe93e79fe06a23bbe8270f90",""]})
			.expect(200)
			.end(function(err,res){
				// Valid
				res.body.status.should.equal(true);
				res.body.result[0].balance.should.equal(667.8601811724393);
				res.body.result[0].addressIsValid.should.equal(true);
				// Invalid
				res.body.result[1].balance.should.equal(-1);
				res.body.result[1].addressIsValid.should.equal(false);
				done();
		});
	});
});


