var express = require("express");
var app = express();
var expressSanitizer = require("express-sanitizer");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var methodOverride = require("method-override");

// APP CONFIG
mongoose.connect("mongodb://localhost/restful_blog_app");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));


// MONGOOSE / MODEL CONFIG
// blog contains:
// title
// image
// body (the text body)
// created (date)
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	// sets created as type Date (ie type String, type Number etc) and the default type of Date to be now
	// default == if specific Date is not given the fallback Date is Date.now
	created: {type: Date, default: Date.now}
});
var Blog = mongoose.model("Blog", blogSchema);


// RESTFUL ROUTES

app.get("/", function(req, res){

	// redirects to /blogs from root 
	res.redirect("/blogs");
});

// INDEX
app.get("/blogs", function(req, res){

	// empty string finds/returns everything from the db
	Blog.find({}, function(err, blogs){
		if(err) {
			console.log(err);
		} else {
			res.render("index", {blogs: blogs});
		}
	});
});

// NEW
app.get("/blogs/new", function(req, res){
	// all you need in the get/new is the render since post handles all the data
	res.render("new");
});

// CREATE
app.post("/blogs", function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	// since in the new.ejs form every form input is inside the blog object (ie blog[title] or blog[name])
	// so if you query it as the data it will contain all the inputs
	// ============================================================
	// Blog.create creates a blog post in db from the form
	Blog.create(req.body.blog, function(err, newBlog){
		if(err) {
			console.log(err);
		} else {
			res.redirect("/blogs");
		}
	});

});

// SHOW
app.get("/blogs/:id", function(req,res){
	// Blog.findById(id, callback)

	Blog.findById(req.params.id, function(err, foundBlog){
		if(err) {
			console.log(err);
			res.redirect("/blogs");
		} else {
			res.render("show", {blog: foundBlog});
		}
	});
});

// EDIT
app.get("/blogs/:id/edit", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err) {
			console.log("Error finding blog");
			res.redirect("/blogs");
		} else {
			res.render("edit", {blog: foundBlog});
		}
	});
});

// UPDATE
app.put("/blogs/:id", function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
		if(err) {
			console.log("Error updating");
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs/" + req.params.id)
		}
	});
});

// DELETE
app.delete("/blogs/:id", function(req, res){
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err) {
			console.log("something went wrong");
		} else {
			res.redirect("/blogs");
		}
	});
});




app.listen(3000, function(){
	console.log("Blog is running");
});