//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const  mongoose =  require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
//Connect to DB and specify DB name
mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true,useUnifiedTopology: true,useFindAndModify:false });
//Describe the schema
const itemsSchema = {
   name: String
  };
//Specify the collection name
const Item = mongoose.model("Item",itemsSchema);

//Add the data to collection
const item1 = new Item({
  name:"Welcome To Your Todo List!"
})
const item2 = new Item({
  name:"Hit + to add a new Item"
})
const item3 = new Item({
  name:"<--- Hit this to delete an Item"
})
const defaultItems = [item1,item2,item3];

const listSchema = {
  name : String,
  item: [itemsSchema]
}
const List =  mongoose.model("List",listSchema);


app.get("/", function(req, res) {

  Item.find({},function(err,foundItems){

    if(foundItems.length === 0){
      //if todo list is empty then insert default items
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err)
      
        }
      })
    res.redirect("/")

    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});

    }
  })

});

app.post("/", function(req, res){

  const newItem = req.body.newItem;
  const listName = req.body.list;
  const item4 = new Item({
    name: newItem
  });

if(listName === "Today"){
  item4.save();
  res.redirect("/");
} else {
  List.findOne({name:listName},function(err,foundList){
    foundList.item.push(item4);
    foundList.save();
    res.redirect('/' + listName)

  })
}



  
});

app.get("/:customList", function(req,res){
  const customList = _.capitalize(req.params.customList); 
  List.findOne({name:customList},function(err,foundList){
    if(!err){
      if(foundList){
        res.render("list", {listTitle: foundList.name, newListItems: foundList.item});
      } else{
        const list = new List({
          name:customList,
          item:defaultItems
        })
        list.save();
        res.redirect('/'+customList);
      }
    }

  })
 
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(8888, function() {
  console.log("Server started on port 8888");
});
app.post('/delete',function(req,res){
const checkedItem = req.body.checkBox;
const deleteName = req.body.listName1;

if(deleteName === "Today"){
  Item.findByIdAndRemove(checkedItem,function(err){
    if(err){
      console.log(err);
    } else {
      res.redirect('/');
    }
  })
} else {
List.findOneAndUpdate({name:deleteName},{$pull:{item:{_id:checkedItem}}},function(err){
  if(!err){
    res.redirect('/'+ deleteName);
  }

})
}

})
